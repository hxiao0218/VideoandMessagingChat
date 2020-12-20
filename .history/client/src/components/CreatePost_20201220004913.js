/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/button-has-type */
/* eslint-disable no-unused-expressions */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useHistory } from "react-router-dom";
import ErrorNotice from "../Errormsg/ErrorNotice";

// const herokuBaseURL = 'https://server2-heroku-new.herokuapp.com/';
const herokuBaseURL = "/";

export default function CreatePost() {
  const history = useHistory();
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [url, setURL] = useState("");
  const [mediaType, setMediaType] = useState("plain text");

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      if (isSubscribed) {
        try {
          const newPost = {
            title,
            body,
            url,
            mediaType,
          };
          const result = await Axios.post(
            `${herokuBaseURL}posts/createPost`,
            newPost,
            {
              headers: { "x-auth-token": localStorage.getItem("auth-token") },
            }
          );
          history.push("");
        } catch {
          console.log("data fetch error");
        }
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, [url]);

  const postDetails = () => {
    const data = new FormData();
    const background =
      "https://images.unsplash.com/photo-1517691748-56ee7506215a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
    data.append("upload_preset", "ChatApp");
    data.append("cloud_name", "chatapp557");
    if (video !== "") {
      // console.log(image);
      setMediaType("video");
      data.append("file", video);
      fetch("https://api.cloudinary.com/v1_1/chatapp557/video/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((d) => {
          setURL(d.url);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // console.log(image);
      setMediaType("image");
      image !== ""
        ? data.append("file", image)
        : data.append("file", background);
      fetch("https://api.cloudinary.com/v1_1/chatapp557/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((d) => {
          setURL(d.url);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
    return (
      <div
        className="card input-field"
        style={{
          margin: "30px auto",
          maxWidth: "800px",
          maxHeight: "1000px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {error && (
          <ErrorNotice message={error} clearError={() => setError(undefined)} />
        )}
        <input
          type="text"
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <form action="#">
          <div className="file-field input-field">
            <div className="btn #64b5f6 blue darken-1">
              <span>Upload an image or gif</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <div className="file-path-wrapper">
              <input
                className="file-path validate"
                type="text"
                placeholder="Please upload an image"
                value={image.name}
              />
            </div>
          </div>
        </form>
        <h6>or </h6>
        <form action="#">
          <div className="file-field input-field">
            <div className="btn #64b5f6 blue darken-1">
              <span>Upload a video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
              />
            </div>
            <div className="file-path-wrapper">
              <input
                className="file-path validate"
                type="text"
                placeholder="Please upload a video"
                value={video.name}
              />
            </div>
          </div>
        </form>
        <button
          className="btn waves-effect waves-light #64b5f6 blue darken-1"
          onClick={() => postDetails()}
        >
          POST
        </button>
      </div>
    );
}
