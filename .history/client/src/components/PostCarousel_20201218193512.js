/* eslint-disable function-paren-newline */
/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable quotes */
import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { Carousel } from "react-responsive-carousel";

import UserContext from "../context/UserContext";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
// import "bootstrap/dist/css/bootstrap.min.css";
// import Carousel from "react-bootstrap/Carousel";

const herokuBaseURL = 'https://server2-heroku-new.herokuapp.com/';

export default function PostCarousel() {
  const [data, setData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const { userData } = useContext(UserContext);

  useEffect(() => {
    const getPosts = async () => {
      const result = await Axios.get(`${herokuBaseURL}posts/allPosts`, {
        headers: { "x-auth-token": localStorage.getItem("auth-token") },
      });
      // console.log(result);
      setData(result.data.posts);
    };
    getPosts();
  }, []);

  return (
    <Carousel
      showThumbs={false}
      infiniteLoop={false}
      autoPlay
      interval={5000}
      transitionTime={150}
      // showArrows={false}
    >
      {data.map((item) =>
        item.mediaType === "video" ? (
          <div>
            {/* <iframe
              width="600"
              height="450"
              title={item.title}
              src={item.media + "?autoplay=1&mute=1"}
              allow="autoplay; encrypted-media"
            /> */}
            <>
              <video className="video" controls autoPlay muted>
                <source src={item.media} type="video/mp4" />
              </video>
              {/* <player url={item.media} /> */}
            </>
          </div>
        ) : (
          <div>
            <img src={item.media} />
            <p className="legend">{item.title}</p>
          </div>
        )
      )}
      <div>
        <img
          alt=""
          src="https://images.unsplash.com/photo-1517691748-56ee7506215a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
        />
        <p className="legend">
          No new posts yet. Please refresh the page or come back later!
        </p>
      </div>
    </Carousel>
  );
}
