import React from "react";
import "./styles.css";

function Button({ text, onClick, variant = "solid", size }) {
  const classes = [
    "btn",
    variant === "outlined" ? "btn--outlined" : "",
    size === "sm" ? "btn--sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} onClick={onClick || undefined}>
      {text}
    </button>
  );
}

export default Button;
