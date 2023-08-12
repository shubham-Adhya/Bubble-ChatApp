import axios from "axios";
import "animate.css";
import { useState, useContext } from "react";
import { UserContext } from "./UserContext.jsx";
import Swal from "sweetalert2";

import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { Spinner } from "@material-tailwind/react";

const Toast = Swal.mixin({
  toast: true,
  showConfirmButton: false,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
  position: "top",
  timer: 3500,
  showClass: {
    popup: "animate__animated animate__slideInDown animate__faster",
  },
  hideClass: {
    popup: "animate__animated animate__slideOutUp animate__faster",
  },
});

export default function RegisterandLoginForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checked , setchecked]= useState(false)
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoginOrRegister, setIsLoginRegister] = useState("login");
  const { setLoggedInUserName, setId, setEmail:setContextEmail, setPic, pic } = useContext(UserContext);
  const [loading, setLoading] = useState(false)


  function postDetails(pics){
    setLoading(true)
    if(!pics){
      setLoading(false)
      return 
    }
    if(pics.type==="image/jpeg" || pics.type==="image/png"){
      const data=new FormData();
        data.append("file", pics);
        data.append("upload_preset", "Bubble-ChatApp");
        data.append("cloud_name", "dgvivvjtu");
        data.append("api_key", "114222667452997");
        data.append("api_secret", "S6GMOuPb05OdlwPFC_gH9mU3K9o");
        fetch("https://api.cloudinary.com/v1_1/dgvivvjtu/image/upload", {
          method: "POST",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            setPic(data.url.toString());
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
    }else{
      alert("Please Select an image")
    }
  }

  async function handleSumbit(ev) {
    ev.preventDefault();

    const url = isLoginOrRegister 
    if(isLoginOrRegister === "register" && (!email || !username || !password || !confirmPassword)){
      // alert("Please fill all the fields")
      Toast.fire({
        icon: "error",
        title: "Please fill all the fields",
      });
      return
    }
    if (isLoginOrRegister === "register" && password !== confirmPassword) {
      // alert("Passwords do not match");
      Toast.fire({
        icon: "error",
        title: "Passwords do not match",
      });
      return;
    }
    if(!checked){
      // alert("Please check terms and conditions")
      Toast.fire({
        icon: "error",
        title: "Please check terms and conditions",
      });
      return
    }
    setLoading(true);
    await axios
      .post(`/user/${url}`, { email, name: username, password, pic })
      .then((res) => {
        // console.log(res.data);
        // alert(res.data.msg);
        Toast.fire({
          icon: "success",
          title: res.data.msg,
        });
        setTimeout(()=>{
          setLoggedInUserName(res.data.name || username);
          setId(res.data._id);
          setContextEmail(res.data.email)
          setPic(res.data.pic)
        },1)
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(()=>{
        setLoading(false)
      })
  }

  return (
    <div className=" bg-blue-50 h-screen items-center flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <Card color="transparent" shadow={false}>
        <div className="text-blue-600 font-bold flex items-center gap-2 p-4 mx-auto h-10 w-auto mb-6 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className=" w-12 h-12"
          >
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
          </svg>
          <Typography
            variant="h1"
            className="font-semibold text-center text-3xl"
          >
            Bubble
          </Typography>
        </div>

        {/* <Typography variant="h4" color="blue-gray" className="text-center ">
            {isLoginOrRegister === "register" ? "Sign Up" : "Login"}
          </Typography>
          <Typography color="gray" className="mt-1 font-normal text-center">
            {isLoginOrRegister === "register"
              ? "Enter your details to register."
              : "Enter your details to login."}
          </Typography> */}

        {/* <form
            className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 "
            onSubmit={handleSumbit}
          >
            <div className="mb-4 flex flex-col gap-6">
              {isLoginOrRegister === "register" && (
                <Input
                  size="lg"
                  label="Name"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                  type="text"
                  required
                />
              )}
              <Input
                size="lg"
                label="Email"
                id="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                type="email"
              />
              <Input
                type="password"
                size="lg"
                label="Password"
                value={password}
                required
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </div>
            <Checkbox
              className=""
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-normal"
                >
                  I agree the
                  <a
                    href="#"
                    className="font-medium transition-colors hover:text-blue-600"
                  >
                    &nbsp;Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Button className="mt-6" fullWidth type="submit">
              {isLoginOrRegister === "register" ? "Register" : "Login"}
            </Button>

            <div className=" text-gray-800 text-center mt-4 font-normal">
              {isLoginOrRegister === "register" && (
                <div>
                  Already have an account?{" "}
                  <button
                    className="font-medium text-blue-600 transition-colors hover:text-blue-800"
                    onClick={() => setIsLoginRegister("login")}
                  >
                    {" "}
                    Login
                  </button>
                </div>
              )}
              {isLoginOrRegister === "login" && (
                <div>
                  Don&apos;t have an account? &nbsp;
                  <button
                    className="font-medium text-blue-600 transition-colors hover:text-blue-800"
                    onClick={() => setIsLoginRegister("register")}
                  >
                    {" "}
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </form> */}
        <Tabs value="Login" className="font-sans">
          <TabsHeader
            className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
            indicatorProps={{
              className:
                "bg-transparent border-b-2 border-blue-600 shadow-none rounded-none",
            }}
          >
            <Tab value="Sign Up" onClick={() => setIsLoginRegister("register")}>
              <Typography
                variant="h4"
                color="blue-gray"
                className="text-center text-xl font-semibold"
              >
                Sign Up
              </Typography>
            </Tab>
            <Tab value="Login" onClick={() => setIsLoginRegister("login")}>
              <Typography
                variant="h4"
                color="blue-gray"
                className="text-center text-xl font-semibold"
              >
                Login
              </Typography>
            </Tab>
          </TabsHeader>
          <TabsBody className=" text-center">
            <TabPanel value="Sign Up">
              <Typography color="gray" className="mt-1 font-normal ">
                Enter your details to register.
              </Typography>
              <form
                className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 "
                onSubmit={handleSumbit}
              >
                <div className="mb-4 flex flex-col gap-6">
                  <Input
                    size="lg"
                    label="Name"
                    name="username"
                    value={username}
                    onChange={(ev) => setUsername(ev.target.value)}
                    type="text"
                    required
                  />

                  <Input
                    size="lg"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    type="email"
                  />
                  <Input
                    type="password"
                    size="lg"
                    label="Password"
                    value={password}
                    required
                    onChange={(ev) => setPassword(ev.target.value)}
                  />
                  <Input
                    type="password"
                    size="lg"
                    label="Confirm Password"
                    value={confirmPassword}
                    required
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                  />

                  <Input
                    label="Upload Your Picture"
                    icon={loading && <Spinner />}
                    variant="static"
                    className=""
                    type="file"
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                  />
                  {/* <Spinner /> */}
                </div>
                <Checkbox
                  className=""
                  id="checkbox1"
                  label={
                    <Typography
                      variant="small"
                      color="gray"
                      className="flex items-center font-normal"
                    >
                      I agree the
                      <a
                        href="#"
                        className="font-medium transition-colors hover:text-blue-600"
                      >
                        &nbsp;Terms and Conditions
                      </a>
                    </Typography>
                  }
                  containerProps={{ className: "-ml-2.5" }}
                  onChange={() => setchecked(true)}
                />
                <Button
                  className="mt-6 flex justify-center"
                  fullWidth
                  type="submit"
                >
                  {loading ? <Spinner /> : "Register"}
                </Button>

              </form>
            </TabPanel>

            <TabPanel value="Login">
              <Typography color="gray" className="mt-1 font-normal ">
                Enter your details to login.
              </Typography>
              <form
                className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 "
                onSubmit={handleSumbit}
              >
                <div className="mb-4 flex flex-col gap-6">
                  <Input
                    size="lg"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    type="email"
                  />
                  <Input
                    type="password"
                    size="lg"
                    label="Password"
                    value={password}
                    required
                    onChange={(ev) => setPassword(ev.target.value)}
                  />
                </div>
                <Checkbox
                  onChange={() => setchecked(true)}
                  id="checkbox2"
                  label={
                    <Typography
                      variant="small"
                      color="gray"
                      className="flex items-center font-normal"
                    >
                      I agree the
                      <a
                        href="#"
                        className="font-medium transition-colors hover:text-blue-600"
                      >
                        &nbsp;Terms and Conditions
                      </a>
                    </Typography>
                  }
                  containerProps={{ className: "-ml-2.5" }}
                />
                <Button
                  className="mt-6 flex justify-center"
                  fullWidth
                  type="submit"
                >
                  {loading ? <Spinner /> : "Login"}
                </Button>
              </form>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </Card>
    </div>
  );
}
