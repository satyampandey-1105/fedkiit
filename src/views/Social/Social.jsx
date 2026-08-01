"use client";

import { useEffect } from "react";
import linkedinlogo from "../../assets/images/SocialMedia/linkedinLogo.svg";
import instalogo from "../../assets/images/SocialMedia/instaLogo.svg";
import styles from "./styles/Social.module.scss";

const Social = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.socialMcontainer}>
      <div className={styles.text}>
        <div className={styles.circleCenter}></div>
        <div className={styles.content}>
          <span>Welcome to the social media page of</span>
          <br />
          <div className={styles.fed}>
            <div className={styles.box} id={styles.box1}>
              <img
                className={styles.instalogo}
                src={instalogo.src}
                alt="Instagram Logo"
              />
              <span
                style={{
                  background: "var(--primary)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {" "}
                FED{" "}
              </span>
              <img
                className={styles.linkedinlogo}
                src={linkedinlogo.src}
                alt="LinkedIn Logo"
              />
            </div>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
};

export default Social;
