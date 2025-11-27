import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from tensorflow.keras.regularizers import l2
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
import pandas as pd
import json
import os
from datetime import datetime

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
INITIAL_LR = 0.0001
NUM_CLASSES = 3

# Paths
PROCESSED_DATA_DIR = 'data/processed'
TRAIN_DIR = os.path.join(PROCESSED_DATA_DIR, 'train')
VAL_DIR = os.path.join(PROCESSED_DATA_DIR, 'validation')
TEST_DIR = os.path.join(PROCESSED_DATA_DIR, 'test')
MODEL_DIR = 'models'
RESULTS_DIR = 'results'

# Create directories
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(os.path.join(RESULTS_DIR, 'training_logs'), exist_ok=True)

class CarDamageModel:
    def __init__(self):
        self.model = None
        self.base_model = None
        self.history = None
        self.class_names = None

    def create_data_generators(self):
        """Create data generators with augmentation"""
        print("\n📁 Loading dataset...")

        # Training data augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=25,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest'
        )

        # Validation and test - only rescaling
        val_test_datagen = ImageDataGenerator(rescale=1./255)

        # Load training data
        self.train_generator = train_datagen.flow_from_directory(
            TRAIN_DIR,
            target_size=(IMG_SIZE, IMG_SIZE),
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=True,
            seed=42
        )

        # Load validation data
        self.val_generator = val_test_datagen.flow_from_directory(
            VAL_DIR,
            target_size=(IMG_SIZE, IMG_SIZE),
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False
        )

        # Load test data
        self.test_generator = val_test_datagen.flow_from_directory(
            TEST_DIR,
            target_size=(IMG_SIZE, IMG_SIZE),
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False
        )

        # Get class names
        self.class_names = list(self.train_generator.class_indices.keys())

        print(f"   ✓ Training samples:   {self.train_generator.samples}")
        print(f"   ✓ Validation samples: {self.val_generator.samples}")
        print(f"   ✓ Test samples:       {self.test_generator.samples}")
        print(f"   ✓ Classes: {self.class_names}")

        # Calculate class weights for imbalanced dataset
        total_samples = self.train_generator.samples
        class_counts = np.bincount(self.train_generator.classes)
        self.class_weights = {i: total_samples / (len(class_counts) * count) 
                             for i, count in enumerate(class_counts)}

        print(f"   ✓ Class weights: {self.class_weights}")

    def build_model(self):
        """Build DenseNet121 model architecture"""
        print("\n🏗️  Building DenseNet121 model...")

        # Load pre-trained DenseNet121 (without top layers)
        self.base_model = DenseNet121(
            weights='imagenet',
            include_top=False,
            input_shape=(IMG_SIZE, IMG_SIZE, 3)
        )

        # Freeze base model initially
        self.base_model.trainable = False

        # Add custom classification head
        x = self.base_model.output
        x = GlobalAveragePooling2D(name='global_avg_pool')(x)
        x = BatchNormalization(name='bn_1')(x)
        x = Dense(512, activation='relu', kernel_regularizer=l2(0.01), name='fc_1')(x)
        x = Dropout(0.5, name='dropout_1')(x)
        x = BatchNormalization(name='bn_2')(x)
        x = Dense(256, activation='relu', kernel_regularizer=l2(0.01), name='fc_2')(x)
        x = Dropout(0.3, name='dropout_2')(x)
        predictions = Dense(NUM_CLASSES, activation='softmax', name='predictions')(x)

        # Create model
        self.model = Model(inputs=self.base_model.input, outputs=predictions)

        print(f"   ✓ Model built successfully")
        print(f"   ✓ Total parameters: {self.model.count_params():,}")
        print(f"   ✓ Trainable parameters: {sum([tf.size(w).numpy() for w in self.model.trainable_weights]):,}")

    def compile_model(self, learning_rate=INITIAL_LR):
        """Compile model with optimizer and loss"""
        self.model.compile(
            optimizer=Adam(learning_rate=learning_rate),
            loss='categorical_crossentropy',
            metrics=[
                'accuracy',
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall'),
                keras.metrics.AUC(name='auc')
            ]
        )
        print(f"   ✓ Model compiled with learning rate: {learning_rate}")

    def get_callbacks(self, phase='phase1'):
        """Create training callbacks"""
        callbacks = [
            ModelCheckpoint(
                filepath=os.path.join(MODEL_DIR, f'best_model_{phase}.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                mode='max',
                verbose=1
            ),
            EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            TensorBoard(
                log_dir=os.path.join(RESULTS_DIR, 'training_logs', 
                                    f'{phase}_{datetime.now().strftime("%Y%m%d_%H%M%S")}'),
                histogram_freq=1
            )
        ]
        return callbacks

    def train(self):
        """Train model in two phases"""
        print("\n" + "="*70)
        print("  🚀 Starting Model Training")
        print("="*70)

        # Phase 1: Train with frozen base model
        print("\n📚 PHASE 1: Training with frozen base model (20 epochs)...")
        self.compile_model(learning_rate=INITIAL_LR)

        history_phase1 = self.model.fit(
            self.train_generator,
            epochs=20,
            validation_data=self.val_generator,
            class_weight=self.class_weights,
            callbacks=self.get_callbacks('phase1'),
            verbose=1
        )

        # Phase 2: Fine-tuning with unfrozen layers
        print("\n📚 PHASE 2: Fine-tuning with unfrozen layers...")

        # Unfreeze last 50 layers of base model
        self.base_model.trainable = True
        for layer in self.base_model.layers[:-50]:
            layer.trainable = False

        # Recompile with lower learning rate
        self.compile_model(learning_rate=INITIAL_LR / 10)

        print(f"   ✓ Unfrozen last 50 layers")
        print(f"   ✓ Trainable parameters: {sum([tf.size(w).numpy() for w in self.model.trainable_weights]):,}")

        history_phase2 = self.model.fit(
            self.train_generator,
            epochs=EPOCHS,
            validation_data=self.val_generator,
            class_weight=self.class_weights,
            callbacks=self.get_callbacks('phase2'),
            verbose=1
        )

        # Combine histories
        self.history = self.combine_histories(history_phase1, history_phase2)

        print("\n✅ Training completed!")

    def combine_histories(self, hist1, hist2):
        """Combine training histories from both phases"""
        combined = {}
        for key in hist1.history.keys():
            combined[key] = hist1.history[key] + hist2.history[key]
        return combined

    def evaluate(self):
        """Evaluate model on test set"""
        print("\n" + "="*70)
        print("  📊 Evaluating Model on Test Set")
        print("="*70 + "\n")

        # Evaluate
        test_loss, test_acc, test_prec, test_rec, test_auc = self.model.evaluate(
            self.test_generator,
            verbose=1
        )

        # Calculate F1 score
        test_f1 = 2 * (test_prec * test_rec) / (test_prec + test_rec) if (test_prec + test_rec) > 0 else 0

        print(f"\n📈 Test Metrics:")
        print(f"   Accuracy:  {test_acc:.4f}")
        print(f"   Precision: {test_prec:.4f}")
        print(f"   Recall:    {test_rec:.4f}")
        print(f"   F1-Score:  {test_f1:.4f}")
        print(f"   AUC:       {test_auc:.4f}")
        print(f"   Loss:      {test_loss:.4f}")

        # Generate predictions
        print(f"\n🔮 Generating predictions...")
        self.test_generator.reset()
        y_pred_probs = self.model.predict(self.test_generator, verbose=1)
        y_pred = np.argmax(y_pred_probs, axis=1)
        y_true = self.test_generator.classes

        # Classification report
        print(f"\n📋 Classification Report:")
        print(classification_report(y_true, y_pred, target_names=self.class_names))

        # Confusion matrix
        self.plot_confusion_matrix(y_true, y_pred)

        # Save metrics
        metrics = {
            'test_accuracy': float(test_acc),
            'test_precision': float(test_prec),
            'test_recall': float(test_rec),
            'test_f1_score': float(test_f1),
            'test_auc': float(test_auc),
            'test_loss': float(test_loss),
            'class_names': self.class_names,
            'evaluation_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        with open(os.path.join(MODEL_DIR, 'model_metrics.json'), 'w') as f:
            json.dump(metrics, f, indent=2)

        print(f"\n   ✓ Metrics saved to {MODEL_DIR}/model_metrics.json")

    def plot_training_history(self):
        """Plot training history"""
        print(f"\n📊 Plotting training history...")

        fig, axes = plt.subplots(2, 2, figsize=(15, 12))

        # Accuracy
        axes[0, 0].plot(self.history['accuracy'], label='Train Accuracy', linewidth=2)
        axes[0, 0].plot(self.history['val_accuracy'], label='Val Accuracy', linewidth=2)
        axes[0, 0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)

        # Loss
        axes[0, 1].plot(self.history['loss'], label='Train Loss', linewidth=2)
        axes[0, 1].plot(self.history['val_loss'], label='Val Loss', linewidth=2)
        axes[0, 1].set_title('Model Loss', fontsize=14, fontweight='bold')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Loss')
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)

        # Precision
        axes[1, 0].plot(self.history['precision'], label='Train Precision', linewidth=2)
        axes[1, 0].plot(self.history['val_precision'], label='Val Precision', linewidth=2)
        axes[1, 0].set_title('Model Precision', fontsize=14, fontweight='bold')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Precision')
        axes[1, 0].legend()
        axes[1, 0].grid(True, alpha=0.3)

        # Recall
        axes[1, 1].plot(self.history['recall'], label='Train Recall', linewidth=2)
        axes[1, 1].plot(self.history['val_recall'], label='Val Recall', linewidth=2)
        axes[1, 1].set_title('Model Recall', fontsize=14, fontweight='bold')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Recall')
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(os.path.join(RESULTS_DIR, 'training_history.png'), dpi=300, bbox_inches='tight')
        print(f"   ✓ Saved to {RESULTS_DIR}/training_history.png")
        plt.close()

    def plot_confusion_matrix(self, y_true, y_pred):
        """Plot confusion matrix"""
        cm = confusion_matrix(y_true, y_pred)

        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=self.class_names, 
                    yticklabels=self.class_names,
                    cbar_kws={'label': 'Count'})
        plt.title('Confusion Matrix', fontsize=16, fontweight='bold', pad=20)
        plt.ylabel('True Label', fontsize=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.tight_layout()
        plt.savefig(os.path.join(RESULTS_DIR, 'confusion_matrix.png'), dpi=300, bbox_inches='tight')
        print(f"   ✓ Saved to {RESULTS_DIR}/confusion_matrix.png")
        plt.close()

    def save_model(self):
        """Save trained model in multiple formats"""
        print(f"\n💾 Saving model...")

        # Save in H5 format
        model_path_h5 = os.path.join(MODEL_DIR, 'densenet121_car_damage.h5')
        self.model.save(model_path_h5)
        print(f"   ✓ Saved H5 model: {model_path_h5}")

        # Save in SavedModel format
        model_path_saved = os.path.join(MODEL_DIR, 'densenet121_savedmodel')
        self.model.save(model_path_saved, save_format='tf')
        print(f"   ✓ Saved TensorFlow model: {model_path_saved}")

        # Save class names
        class_names_path = os.path.join(MODEL_DIR, 'class_names.json')
        with open(class_names_path, 'w') as f:
            json.dump(self.class_names, f)
        print(f"   ✓ Saved class names: {class_names_path}")

        print(f"\n✅ Model saved successfully!")

def main():
    """Main training pipeline"""
    print("\n" + "="*70)
    print("  AutoSureAI - Phase 1: Model Training")
    print("  DenseNet121 for Car Damage Severity Classification")
    print("="*70)

    # Check if GPU is available
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"\n🎮 GPU Available: {len(gpus)} device(s)")
        for gpu in gpus:
            print(f"   - {gpu.name}")
    else:
        print(f"\n💻 Running on CPU")

    # Initialize model
    model = CarDamageModel()

    # Create data generators
    model.create_data_generators()

    # Build model
    model.build_model()

    # Train model
    model.train()

    # Plot training history
    model.plot_training_history()

    # Evaluate model
    model.evaluate()

    # Save model
    model.save_model()

    print("\n" + "="*70)
    print("  ✅ Phase 1 Complete!")
    print("="*70)
    print(f"\n  📁 Model saved to: {MODEL_DIR}/")
    print(f"  📊 Results saved to: {RESULTS_DIR}/")
    print(f"\n  🚀 Next Step: Test the Flask API (Phase 2)")
    print(f"     python app.py")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()