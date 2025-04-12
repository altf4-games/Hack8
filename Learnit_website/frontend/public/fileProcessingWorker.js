// File processing worker
self.onmessage = async (event) => {
  const { file } = event.data;
  
  try {
    // Since we can't use FileReader directly in a worker,
    // we'll use a different approach with FileReaderSync which is available in workers
    const reader = new FileReaderSync();
    
    let content;
    try {
      content = reader.readAsDataURL(file);
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
    
    // Send the result back to the main thread
    self.postMessage({ content });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
}; 