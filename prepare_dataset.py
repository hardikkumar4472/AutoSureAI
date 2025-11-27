"""
AutoSureAI - Phase 1: Dataset Preparation Script
Organizes car damage images into training, validation, and test sets
Classifies damage severity: Minor, Moderate, Severe
"""

import os
import shutil
import cv2
import numpy as np
from PIL import Image
import pandas as pd
from sklearn.model_selection import train_test_split
import json
from pathlib import Path
import hashlib
from datetime import datetime

# Configuration
RAW_DATA_DIR = 'AutoSureAI/ml-service/data/raw'
PROCESSED_DATA_DIR = 'AutoSureAI/ml-service/data/processed'
ANNOTATIONS_FILE = 'AutoSureAI/ml-service/data/annotations.csv'

# Split ratios
TRAIN_SPLIT = 0.70
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15

# Image specifications
TARGET_SIZE = (224, 224)
MIN_IMAGE_SIZE = (100, 100)
MAX_FILE_SIZE_MB = 10
SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']

# Severity classification and repair costs (in USD)
SEVERITY_CONFIG = {
    'minor': {
        'label': 'Minor',
        'description': 'Small dents, scratches, minor bumper damage',
        'repair_cost_range': (500, 2000),
        'keywords': ['scratch', 'dent', 'minor', 'small', 'bumper']
    },
    'moderate': {
        'label': 'Moderate',
        'description': 'Significant body damage, broken lights, door damage',
        'repair_cost_range': (2000, 8000),
        'keywords': ['door', 'panel', 'moderate', 'broken', 'damaged']
    },
    'severe': {
        'label': 'Severe',
        'description': 'Major structural damage, totaled vehicle, frame damage',
        'repair_cost_range': (8000, 25000),
        'keywords': ['totaled', 'severe', 'crushed', 'frame', 'major']
    }
}

class DatasetPreparator:
    def __init__(self):
        self.stats = {
            'total_images': 0,
            'valid_images': 0,
            'invalid_images': 0,
            'duplicates': 0,
            'severity_distribution': {'minor': 0, 'moderate': 0, 'severe': 0}
        }
        self.image_hashes = set()
        self.annotations_data = []
        
    def calculate_image_hash(self, image_path):
        """Calculate MD5 hash of image to detect duplicates"""
        try:
            with open(image_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception as e:
            print(f"Error hashing {image_path}: {e}")
            return None
    
    def validate_image(self, image_path):
        """Validate image format, size, and quality"""
        try:
            # Check file size
            file_size_mb = os.path.getsize(image_path) / (1024 * 1024)
            if file_size_mb > MAX_FILE_SIZE_MB:
                print(f"⚠️  Image too large: {image_path} ({file_size_mb:.2f}MB)")
                return False
            
            # Check if file can be opened
            img = Image.open(image_path)
            img.verify()
            
            # Re-open for actual processing
            img = Image.open(image_path)
            
            # Check image format
            if img.format.lower() not in ['jpeg', 'jpg', 'png', 'bmp', 'tiff']:
                print(f"⚠️  Unsupported format: {image_path}")
                return False
            
            # Check image size
            if img.size[0] < MIN_IMAGE_SIZE[0] or img.size[1] < MIN_IMAGE_SIZE[1]:
                print(f"⚠️  Image too small: {image_path} ({img.size})")
                return False
            
            # Check if image is grayscale or RGB
            if img.mode not in ['RGB', 'L', 'RGBA']:
                print(f"⚠️  Invalid color mode: {image_path} ({img.mode})")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Invalid image: {image_path} - {e}")
            return False
    
    def preprocess_image(self, image_path, output_path):
        """Preprocess and save image"""
        try:
            img = Image.open(image_path)
            
            # Convert RGBA to RGB
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Convert grayscale to RGB
            if img.mode == 'L':
                img = img.convert('RGB')
            
            # Resize image while maintaining aspect ratio
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            
            # Save processed image
            img.save(output_path, 'JPEG', quality=95)
            return True
            
        except Exception as e:
            print(f"❌ Error preprocessing {image_path}: {e}")
            return False
    
    def estimate_repair_cost(self, severity):
        """Estimate repair cost based on severity"""
        cost_range = SEVERITY_CONFIG[severity]['repair_cost_range']
        # Generate random cost within range with normal distribution
        mean_cost = (cost_range[0] + cost_range[1]) / 2
        std_dev = (cost_range[1] - cost_range[0]) / 6
        cost = np.random.normal(mean_cost, std_dev)
        cost = np.clip(cost, cost_range[0], cost_range[1])
        return round(cost, 2)
    
    def organize_dataset(self):
        """Organize raw images into processed train/val/test splits"""
        print("\n" + "="*70)
        print("  AutoSureAI - Phase 1: Dataset Preparation")
        print("="*70 + "\n")
        
        # Check if raw data directory exists
        if not os.path.exists(RAW_DATA_DIR):
            print(f"❌ Error: {RAW_DATA_DIR} directory not found!")
            print(f"Please create the following structure:")
            print(f"  {RAW_DATA_DIR}/")
            print(f"    ├── minor/")
            print(f"    ├── moderate/")
            print(f"    └── severe/")
            return
        
        # Process each severity category
        all_image_data = []
        
        for severity in ['minor', 'moderate', 'severe']:
            severity_dir = os.path.join(RAW_DATA_DIR, severity)
            
            if not os.path.exists(severity_dir):
                print(f"⚠️  Warning: {severity_dir} not found, skipping...")
                continue
            
            print(f"\n📂 Processing '{severity.upper()}' images from {severity_dir}...")
            
            # Get all images in directory
            image_files = []
            for ext in SUPPORTED_FORMATS:
                image_files.extend(Path(severity_dir).glob(f'*{ext}'))
                image_files.extend(Path(severity_dir).glob(f'*{ext.upper()}'))
            
            print(f"   Found {len(image_files)} images")
            
            for idx, image_path in enumerate(image_files, 1):
                self.stats['total_images'] += 1
                image_path = str(image_path)
                
                # Calculate hash to check for duplicates
                img_hash = self.calculate_image_hash(image_path)
                if img_hash in self.image_hashes:
                    self.stats['duplicates'] += 1
                    print(f"   ⚠️  Duplicate: {os.path.basename(image_path)}")
                    continue
                
                # Validate image
                if not self.validate_image(image_path):
                    self.stats['invalid_images'] += 1
                    continue
                
                # Add to valid images
                self.image_hashes.add(img_hash)
                self.stats['valid_images'] += 1
                self.stats['severity_distribution'][severity] += 1
                
                # Store image data
                all_image_data.append({
                    'original_path': image_path,
                    'filename': os.path.basename(image_path),
                    'severity': severity,
                    'hash': img_hash
                })
                
                if idx % 10 == 0:
                    print(f"   ✓ Processed {idx}/{len(image_files)} images", end='\r')
            
            print(f"   ✓ Processed {len(image_files)}/{len(image_files)} images")
        
        if len(all_image_data) == 0:
            print("\n❌ No valid images found! Please add images to the raw data directory.")
            return
        
        # Split dataset
        print(f"\n📊 Splitting dataset...")
        print(f"   Total valid images: {len(all_image_data)}")
        
        # Stratified split to maintain severity distribution
        df = pd.DataFrame(all_image_data)
        
        # Split: train, temp
        train_df, temp_df = train_test_split(
            df, test_size=(VAL_SPLIT + TEST_SPLIT),
            stratify=df['severity'], random_state=42
        )
        
        # Split: validation, test
        val_df, test_df = train_test_split(
            temp_df, test_size=(TEST_SPLIT / (VAL_SPLIT + TEST_SPLIT)),
            stratify=temp_df['severity'], random_state=42
        )
        
        print(f"   Training:   {len(train_df)} images ({TRAIN_SPLIT*100:.0f}%)")
        print(f"   Validation: {len(val_df)} images ({VAL_SPLIT*100:.0f}%)")
        print(f"   Test:       {len(test_df)} images ({TEST_SPLIT*100:.0f}%)")
        
        # Copy images to processed directory
        print(f"\n📁 Organizing processed dataset...")
        
        splits = {
            'train': train_df,
            'validation': val_df,
            'test': test_df
        }
        
        for split_name, split_df in splits.items():
            print(f"\n   Processing {split_name} set...")
            
            for idx, row in split_df.iterrows():
                severity = row['severity']
                output_dir = os.path.join(PROCESSED_DATA_DIR, split_name, severity)
                os.makedirs(output_dir, exist_ok=True)
                
                # Generate new filename
                new_filename = f"{severity}_{row['hash'][:8]}_{idx}.jpg"
                output_path = os.path.join(output_dir, new_filename)
                
                # Preprocess and save image
                if self.preprocess_image(row['original_path'], output_path):
                    # Generate repair cost estimate
                    repair_cost = self.estimate_repair_cost(severity)
                    
                    # Add to annotations
                    self.annotations_data.append({
                        'image_id': f"{split_name}_{idx}",
                        'filename': new_filename,
                        'split': split_name,
                        'severity': severity,
                        'severity_label': SEVERITY_CONFIG[severity]['label'],
                        'repair_cost_usd': repair_cost,
                        'repair_cost_min': SEVERITY_CONFIG[severity]['repair_cost_range'][0],
                        'repair_cost_max': SEVERITY_CONFIG[severity]['repair_cost_range'][1],
                        'processed_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
        
        # Save annotations to CSV
        print(f"\n💾 Saving annotations...")
        annotations_df = pd.DataFrame(self.annotations_data)
        annotations_df.to_csv(ANNOTATIONS_FILE, index=False)
        print(f"   ✓ Saved {len(annotations_df)} annotations to {ANNOTATIONS_FILE}")
        
        # Save dataset statistics
        self.save_statistics(annotations_df)
        
        # Print summary
        self.print_summary()
    
    def save_statistics(self, annotations_df):
        """Save dataset statistics to JSON"""
        stats_file = 'data/dataset_statistics.json'
        
        statistics = {
            'dataset_info': {
                'total_images': len(annotations_df),
                'train_images': len(annotations_df[annotations_df['split'] == 'train']),
                'val_images': len(annotations_df[annotations_df['split'] == 'validation']),
                'test_images': len(annotations_df[annotations_df['split'] == 'test']),
            },
            'severity_distribution': {
                'minor': int(annotations_df[annotations_df['severity'] == 'minor'].shape[0]),
                'moderate': int(annotations_df[annotations_df['severity'] == 'moderate'].shape[0]),
                'severe': int(annotations_df[annotations_df['severity'] == 'severe'].shape[0]),
            },
            'repair_cost_stats': {
                'mean': float(annotations_df['repair_cost_usd'].mean()),
                'median': float(annotations_df['repair_cost_usd'].median()),
                'std': float(annotations_df['repair_cost_usd'].std()),
                'min': float(annotations_df['repair_cost_usd'].min()),
                'max': float(annotations_df['repair_cost_usd'].max()),
            },
            'processing_info': {
                'total_processed': self.stats['total_images'],
                'valid_images': self.stats['valid_images'],
                'invalid_images': self.stats['invalid_images'],
                'duplicates_removed': self.stats['duplicates'],
                'processed_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
        
        with open(stats_file, 'w') as f:
            json.dump(statistics, f, indent=2)
        
        print(f"   ✓ Saved statistics to {stats_file}")
    
    def print_summary(self):
        """Print dataset preparation summary"""
        print("\n" + "="*70)
        print("  📊 Dataset Preparation Summary")
        print("="*70)
        print(f"\n  Total Images Found:     {self.stats['total_images']}")
        print(f"  Valid Images:           {self.stats['valid_images']}")
        print(f"  Invalid Images:         {self.stats['invalid_images']}")
        print(f"  Duplicates Removed:     {self.stats['duplicates']}")
        
        print(f"\n  Severity Distribution:")
        print(f"    Minor:    {self.stats['severity_distribution']['minor']:4d} images")
        print(f"    Moderate: {self.stats['severity_distribution']['moderate']:4d} images")
        print(f"    Severe:   {self.stats['severity_distribution']['severe']:4d} images")
        
        print("\n" + "="*70)
        print("  ✅ Dataset Preparation Complete!")
        print("="*70)
        print(f"\n  📁 Processed data saved to: {PROCESSED_DATA_DIR}/")
        print(f"  📄 Annotations saved to: {ANNOTATIONS_FILE}")
        print(f"\n  🚀 Next Step: Run training script")
        print(f"     python scripts/train_model.py")
        print("\n" + "="*70 + "\n")

def main():
    """Main execution"""
    preparator = DatasetPreparator()
    preparator.organize_dataset()

if __name__ == "__main__":
    main()