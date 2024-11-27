import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;
console.log(SERVER_URL);
export default {
    post: {
        uploadExcel : async (formData : FormData,gameId: string | undefined) => {
            try {
                console.log(gameId,"gameId")
                const response = await axios.post(`${SERVER_URL}/api/upload-excel?quizId=${gameId}`, formData);
                return response.data;
              } catch (err) {
                throw err;
              }
        }
    },
    get : {
        getQuestions : async (quizId : string) => {
            try {
                const response = await axios.get(`${SERVER_URL}/api/qna?quizId=${quizId}`);
          console.log(response)
                return response.data;
              } catch (err) {
                throw err;
              }
        }
    }
}