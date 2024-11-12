import axios from "axios";
export default {
    post: {
        uploadExcel : async (formData : FormData) => {
            try {
                console.log(formData)
                const response = await axios.post('http://172.17.10.89:3001/add-questions', formData);
                return response.data;
              } catch (err) {
                throw err;
              }
        }
    },
    get : {
        getQuestions : async (quizId : string) => {
            try {
                const response = await axios.get(`http://172.17.10.89:3001/get-questions?quizId=${quizId}`);
          console.log(response)
                return response.data;
              } catch (err) {
                throw err;
              }
        }
    }
}