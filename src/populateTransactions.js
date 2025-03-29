import axios from 'axios';

// endpoint: http://localhost:5000/transactions/create

async function populateDatabase(req, res){
    try{
        const response = await axios.post('http://localhost:5000/transactions/create', {
            uid: "kiblykat",
            steamItem: req.body.steamItem,
            price: req.body.price,
            type: req.body.positiveNegative,
            quantity: req.body.date
        });
        console.log(response.data);
    }catch(err){
        console.log(err)
    }
}

