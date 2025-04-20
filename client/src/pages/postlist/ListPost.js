import React, { Fragment, useState, useEffect } from "react";
import EditPost from "./EditPost";

const ListPost = ({ allPosts, setPostsChange }) => {
  console.log(allPosts);
  const [posts, setPost] = useState([]); //useState to set posts to

  //delete post function

  async function deletePost(id) {
    try {
      await fetch(`http://localhost:5000/Posting/delete-post/${id}`, {
        method: "DELETE",
        headers: { jwt_token: localStorage.token }
      });

      setPost(posts.filter(post => post.post_id !== id));
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    setPost(allPosts);
  }, [allPosts]);

  console.log(posts);

  return (
    <Fragment>
      {" "}
      <table className="table mt-5">
        <thead>
          <tr>
            {/* Commented out Edit and Delete as they are not needed anymore
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
            */}
          </tr>
        </thead>
        <tbody>
          {/*<tr>
            <td>John</td>
            <td>Doe</td>
            <td>john@example.com</td>
          </tr> */}

          {posts.length !== 0 &&
            posts[0].post_id !== null &&
            posts.map(post => (
              <tr key={post.post_id}>
                <td>{post.title}</td>
                <td>
                  <EditPost post={post} setPostsChange={setPostsChange} />
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => deletePost(post.post_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default ListPost;