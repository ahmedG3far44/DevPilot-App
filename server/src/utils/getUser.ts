interface User{
    id:string;
    name:string;
    email:string;
    login:string;
    avatar_url:string;
}

const getUser = async (token:string)=> {

    try{
        if(!token)return

    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "node-fetch",
        },
      });
      const githubUser = await userResponse.json();

      console.log(githubUser)

      const user:User = {
        id: githubUser.id,
        name:githubUser.name,
        email: githubUser.email,
        login: githubUser.login,
        avatar_url:githubUser.avatar
      };

      return user
    }catch(error){
        return null;
    }
}