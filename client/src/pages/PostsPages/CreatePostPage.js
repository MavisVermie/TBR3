import React, { useState } from 'react';
import { toast } from 'react-toastify';

function CreatePostPage({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [primary, setPrimary] = useState(null);
  const [extra, setExtra] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("primary", primary);

    // Append multiple extra images
    for (let i = 0; i < extra.length; i++) {
      formData.append("extra", extra[i]); // field name must match backend
    }

    setIsUploading(true);

    try {
      const response = await fetch("http://localhost:5000/create_post", {
        method: "POST",
        headers: {
          jwt_token: localStorage.getItem("token"),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Created Item Post Successfully");

        if (onPostCreated) onPostCreated();

        setTitle("");
        setDescription("");
        setPrimary(null);
        setExtra([]);
      } else {
        toast.error("Unable to create Item Post");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("An error occurred");
    } finally {
      setIsUploading(false);
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
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border rounded-md py-2 px-3 shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="mt-1 block w-full border rounded-md py-2 px-3 shadow-sm"
            />
          </div>

          {/* Primary Image */}
          <div>
            <label htmlFor="primary" className="block text-sm font-medium text-gray-700">Primary Image:</label>
            <input
              type="file"
              id="primary"
              onChange={(e) => setPrimary(e.target.files[0])}
              required
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </div>

          {/* Extra Images */}
          <div>
            <label htmlFor="extra" className="block text-sm font-medium text-gray-700">Extra Images (optional):</label>
            <input
              type="file"
              id="extra"
              multiple
              onChange={(e) => setExtra([...e.target.files])}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
