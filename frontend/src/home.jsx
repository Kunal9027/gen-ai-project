import React, { useState } from "react";
import axios from "axios";

function PDFUploader() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setText(res.data.text);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="application/pdf" />
      <button onClick={handleUpload}>Upload PDF</button>
      <pre>{text}</pre>
    </div>
  );
}

export default PDFUploader;
