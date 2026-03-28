require('dotenv').config();
const axios = require('axios');

const testNews = async () => {
    const category = "business";
    const url = `http://newsapi.org/v2/top-headlines?country=in&category=${category}&apiKey=${process.env.NEWS_API_KEY}`;
    console.log("TESTING_URL_HTTP:", url);
    try {
        const res = await axios.get(url);
        console.log("SUCCESS! ARTICLES:", res.data.totalResults);
    } catch (err) {
        console.error("FAILED!", err.response?.data || err.message);
    }
};

testNews();
