import React, {useEffect, useState} from 'react'
import HomePage from './HomePage'
import CreatePostPage from './CreatePostPage';
import ListPost from './postlist/ListPost';
import { toast } from 'react-toastify';


export default function ProfilePage({isAuthenticated, checkAuthenticated}) {
  const [name, setName] = useState("");
  // const [zip_code, setZip_code] = useState("");
  // const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState('');
  const [userId, setUserId] = useState('');
  const [posts, setPosts] = useState([]);
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    zip_code: ''
  });
    const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

    const { username, password, email, zip_code } = inputs;

    const [allPosts, setAllPosts] = useState([]);
    const [postsChange, setPostsChange] = useState(false);
  
    const getProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/Posting/", {
          method: "GET",
          headers: { jwt_token: localStorage.token },
        });
  
        const parseData = await res.json();
        setUserId(parseData[0].user_id);
        // Assuming parseData is an array with at least one element
        if (parseData.length > 0) {
          setInputs(prevState => ({
            ...prevState,
            username: parseData[0].username,
            zip_code: parseData[0].zip_code,
            email: parseData[0].email
          }));
        }

        console.log()
        // setName(parseData[0].username); // name is the first array item
        // setZip_code(parseData[0].zip_code);
        // setEmail(parseData[0].email);
      } catch (err) {
        console.error(err.message);
      }
    };

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const response = await fetch("http://localhost:5000/posts/user", {
            method: "GET",
            headers: { jwt_token: localStorage.token },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          const postData = await response.json();
          setPosts(postData);
        } catch (error) {
          console.error('Error fetching posts:', error.message);
        }
      };
    
      fetchPosts();
    }, []); // No dependency array is needed here as we're only fetching once on component mount
    
    useEffect(() => {
      getProfile(); // Fetch user profile information
    }, []); // Run once on component mount


    const deletePost = async (postId) => {
      try {
        const response = await fetch(`http://localhost:5000/posts/${postId}`, {
          method: "DELETE",
          headers: { jwt_token: localStorage.token },
        });
    
        if (!response.ok) {
          throw new Error('Failed to delete the post');
        }
    
        // If delete is successful, filter out the deleted post from the local state
        setPosts(posts.filter(post => post.post_id !== postId));
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete the post');
      }
    };
    
      // Function to focus input field
  const focusInput = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // References for input fields
  const emailRef = React.useRef(null);
  const zipCodeRef = React.useRef(null);
  const usernameRef = React.useRef(null);

    const onSubmitCredentials = async e => {
      e.preventDefault();
      try {
        const body = { username, email, zip_code };
        const response = await fetch(
          'http://localhost:5000/authentication/update-credentials', // Adjusted to the new endpoint
          {
            method: 'PUT', // Changed to PUT to match the server-side route
            headers: {
              'Content-type': 'application/json',
              'jwt_token': localStorage.token // Make sure the header name matches what your middleware expects
            },
            body: JSON.stringify(body)
          }
        );
    
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }
    
        toast.success('Credentials updated successfully!');
        const parseRes = await response.json();
        // Update the state or perform necessary actions after successful update
      } catch (err) {
        console.error('Error:', err.message);
        toast.error(`Unable to update credentials: ${err.message}`);
      }
    };
    


    useEffect(() => {
        checkAuthenticated();
      }, []);
    
      useEffect(() => {
        getProfile();
        setPostsChange(false);
      }, [postsChange]);

      return isAuthenticated ? (
        <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start">
          {/* Profile Info Section */}
          <div className="text-center md:text-left md:ml-30 lg:ml-40"> {/* Adjust the margin-left (ml) values as needed for different screen sizes */}
  <div className="w-32 h-32 bg-indigo-100 rounded-full overflow-hidden mx-auto">
    {/* Profile Image */}
    <img src="logo.png" alt="Profile" className="h-full w-full" />
  </div>
  <div className="mt-4">
    <h1 className="text-2xl font-semibold text-gray-700">{inputs.username}</h1>
    <p className="text-gray-600">{inputs.email}</p>
  </div>
</div>
            
            {/* Update Credentials Form */}
            <div className="mt-6 md:mt-0 md:flex-1 md:max-w-sm">
              <h2 className="text-lg font-semibold text-gray-700 text-center">Update Credentials</h2>
              <form onSubmit={onSubmitCredentials} className="flex flex-col items-center">
                {/* Email Input */}
                <div className="mt-4 flex w-full justify-between">
                  <input
                    ref={emailRef}
                    type="text"
                    className="form-input"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Email"
                  />
                  <button type="button" onClick={() => focusInput(emailRef)}>Change</button>
                </div>
                {/* Zip Code Input */}
                <div className="mt-4 flex w-full justify-between">
                  <input
                    ref={zipCodeRef}
                    type="text"
                    className="form-input"
                    name="zip_code"
                    value={zip_code}
                    onChange={onChange}
                    placeholder="Zip Code"
                  />
                  <button type="button" onClick={() => focusInput(zipCodeRef)}>Change</button>
                </div>
                {/* Username Input */}
                <div className="mt-4 flex w-full justify-between">
                  <input
                    ref={usernameRef}
                    type="text"
                    className="form-input"
                    name="username"
                    value={username}
                    onChange={onChange}
                    placeholder="Username"
                  />
                  <button type="button" onClick={() => focusInput(usernameRef)}>Change</button>
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                >
                  Update Credentials
                </button>
              </form>
            </div>
          </div>

{/* Posts Section */}
<div className="mt-10 w-full">
  <h2 className="text-lg font-semibold text-gray-700 text-center mb-4">Your Posts</h2>
  <div className="flex justify-center items-center flex-col"> {/* Flex container to center children */}
    {posts.map(post => (
      <div key={post.post_id} className="my-4 w-full max-w-md mx-auto"> {/* max-w-md to constrain width, mx-auto to center horizontally */}
        <div className="border rounded shadow-lg p-4 text-center"> {/* Center text */}
          <p className="font-semibold mb-2">{post.title}</p> {/* Add margin bottom */}
          <img
            src={`data:image/*;base64,${post.attached_photo}`}
            alt={post.title}
            className="my-2" // Add margin to the top and bottom
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} // Ensure image fits within bounds
          />
          <button
            onClick={() => deletePost(post.post_id)}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 w-full mt-2" // Full width button
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
</div>
) : (
  <HomePage />
);
    }