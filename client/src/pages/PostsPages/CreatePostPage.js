// Frontend: CreatePostPage.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';

function CreatePostPage({ checkAuthenticated, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedItem, setUploadedItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("pic", file);
  
    setIsUploading(true); // Show spinner

    try {
      const response = await fetch("http://localhost:5000/create_post", {
        method: "POST",
        headers: {
          "jwt_token": localStorage.getItem('token'),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Created Item Post Successfully");

        setUploadedItem({
          title: title,
          imageUrl: URL.createObjectURL(file),
        });

        // ✅ Notify parent to refresh posts
        if (onPostCreated) {
          onPostCreated();
        }

        // Optional: Clear form
        setTitle("");
        setFile(null);
      } else {
        toast.error("Unable to create Item Post");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("An error occurred");
    } finally {
      setIsUploading(false); // Hide spinner
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-20"> 
      <div className="container mx-auto p-6 max-w-md bg-white shadow-md rounded-lg mt-12">
        <h1 className="text-2xl font-bold text-center mb-6">Create a New Post</h1>
        
        {isUploading && (
          <p className="text-center text-sm text-gray-600 mb-4">Uploading...</p>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
            <input 
              type="text" 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="pic" className="block text-sm font-medium text-gray-700">Choose Image:</label>
            <input 
              type="file" 
              id="pic" 
              onChange={(e) => setFile(e.target.files[0])} 
              required 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-green-600 hover:file:bg-indigo-100"
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Upload
          </button>
        </form>

        {uploadedItem && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">Uploaded Item:</h3>
            <p className="text-sm text-gray-800">{uploadedItem.title}</p>
            <img src={uploadedItem.imageUrl} alt="Uploaded" className="mt-2 max-w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePostPage;
