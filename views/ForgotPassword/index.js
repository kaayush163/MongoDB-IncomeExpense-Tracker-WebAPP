async function forgotpassword(e) {
    e.preventDefault();
    console.log(e.target.name);
    const form = new FormData(e.target);

    console.log(form);
    
    const userDetails = {
        email: form.get("email"),
    }
    console.log(userDetails)
    alert('Mail Sent Successfully on your account')
    axios.post('http://localhost:3000/password/forgotpassword',userDetails).then(response => {
        console.log(response);

        document.body.innerHTML += `<h1 style="text-align:center; color:yellow;">Check your Email for Reset password link and close this tab</h1>`
        // if(response.status === 202){
        //     document.body.innerHTML += '<div style="color:red;">Mail Successfuly sent <div>'
        // } else {
        //     throw new Error('Something went wrong!!!')
        // }
    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}