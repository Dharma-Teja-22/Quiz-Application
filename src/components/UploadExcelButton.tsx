import { Loader2, Upload } from "lucide-react";
import React, { useContext, useState } from "react";
import { Question, useGameStore } from "../store/gameStore";
import API from "../services/API";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

const CustomUploadButton: React.FC = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { gameId } = useParams();
  const socket = useContext(SocketContext);

  // Function to handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const result = await API.post.uploadExcel(formData, gameId);
        // console.log(response.data.questions)
        if (result) {
          localStorage.setItem("localQuestions",JSON.stringify(result.questions))
          useGameStore.getState().setQuestions(result.questions);
          socket?.emit("create-game", { gameId, questions: result.questions.map((question : Question) => ({...question,showAnswer : false})) });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Trigger file input click when button is clicked
  const handleButtonClick = (): void => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Custom button to trigger file input */}
      {isUploading ? (
        <button className="bg-miracle-mediumBlue/70 p-2 rounded-lg text-white">
          <Loader2 className="inline h-5 w-5 animate-spin" /> Uploading...
        </button>
      ) : (
        <button
          onClick={handleButtonClick}
          className="bg-miracle-mediumBlue p-2 rounded-lg text-white"
        >
          <Upload className="inline h-5 w-5" /> Upload File
        </button>
      )}
    </div>
  );
};

export default CustomUploadButton;
