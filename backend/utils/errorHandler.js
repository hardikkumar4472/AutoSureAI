export const handleMongoError = (err, res) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const readableField = field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
      
    return res.status(400).json({ 
      message: `${readableField} already exists. Please use a different one.`,
      field: field 
    });
  }
  
  console.error("Database Error:", err);
  return res.status(500).json({ message: err.message || "Internal Server Error" });
};
