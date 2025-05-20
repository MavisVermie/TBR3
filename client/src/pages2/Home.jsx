import React from 'react';
const Home=()=>{
    return (
        <div style={StyleSheet.container}>
           <h1 style={StyleSheet.title}>Welcome to TBR3</h1>
           <p style={text}>We are glad to have you on our site</p>
        </div>
    );
};
const styles={
    container:{
padding:'2rem',


    },
title:{
    fontSize:'2rem',
    color:'#333'
},
text:{
    fontSize:'1.2rem',
    color:'#555',
},

}
export default Home;