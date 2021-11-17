
const express =require('express');
const app=express();
const cors=require('cors');
app.use(cors());
app.use(express.json())
const port=process.env.PORT;
app.listen(port,()=>{
    console.log("listening on ",port)
})
const Web3 = require("web3");
const fs = require('fs');
var web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');
let eth='0xae13d989dac2f0debff460ac112a837c89baa7cd'
const to='0xE07bB478Def57F3776A92D8c085c0a4E36B37181'
const token='0x808c1c5D25bAbBcce4F3818EfA95dF432f97bc2a';
const router='0xAd2A578BE10a13De4c0249B34416F18EF751DE41';
const InAmount='10'
let rawdata = fs.readFileSync('abi.json');
let abi = JSON.parse(rawdata);

let lock=false;
app.get('/buy',(req,res)=>{
    if(!lock)
    {   
        lock=true;
        buytoken(res,req.query.prvKey,req.query.amount,req.query.token);
    }
})

app.get('/sell',(req,res)=>{
    if(!lock)
    {   
        lock=true;
        selltoken(res,req.query.prvKey,req.query.amount,req.query.token);
    }
})

    
    


async function buytoken(res,prvKey,amountWant,tokenaddress)
{
    var Router = new web3.eth.Contract(abi, router);
    var from = web3.eth.accounts.privateKeyToAccount(prvKey,true);
    console.log(from.address)
    web3.eth.accounts.wallet.add(from);
    eth=eth.toLowerCase()
    const path=[eth,tokenaddress]
    const data=await Router.methods.getAmountsOut(amountWant,path).call()
    const amountIn=''+data[0]
    const amountOut=''+data[1]
    console.log(amountIn,amountOut)
    const tx=await Router.methods.swapExactETHForTokens(amountOut, path, to, Date.now()*3*60).send({value:amountWant,from:from.address,gas: '999999'})
    
    res.status(201).send({result:tx.transactionHash})
    lock=false;
}

async function selltoken(res,prvKey,amountWant,tokenaddress)
{
    var Router = new web3.eth.Contract(abi, router);
    var from = web3.eth.accounts.privateKeyToAccount(prvKey,true);
    console.log(from.address)
    web3.eth.accounts.wallet.add(from);
    eth=eth.toLowerCase()
    const path=[tokenaddress,eth]
    const data=await Router.methods.getAmountsOut(amountWant,path).call()
    const amountIn=''+data[0]
    const amountOut=''+data[1]
    console.log(amountIn,amountOut)
    const tx=await Router.methods.swapExactTokensForETH(amountIn, amountOut, path, to, Date.now()*3*60).send({from:from.address,gas: '999999'})
    res.status(201).send({result:tx.transactionHash})
    lock=false;
}

