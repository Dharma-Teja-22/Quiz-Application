import axios from "axios";
export default {
    post: {
        uploadExcel : async (formData : FormData,gameId: string | undefined) => {
            try {
                console.log(gameId,"gameId")
                const response = await axios.post(`http://172.17.10.127:3001/api/upload-excel?quizId=${gameId}`, formData);
                return response.data;
              } catch (err) {
                throw err;
              }
        }
    },
    get : {
        getQuestions : async (quizId : string) => {
            try {
                const response = await axios.get(`http://172.17.10.127:3001/api/qna?quizId=${quizId}`);
          console.log(response)
                return response.data;
              } catch (err) {
                throw err;
              }
        }
    }
}