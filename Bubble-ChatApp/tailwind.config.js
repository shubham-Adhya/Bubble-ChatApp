
import withMT from "@material-tailwind/react/utils/withMT"


export default withMT({
    content: [
      "./src/*.jsx",
      "./src/components/**/*.jsx"
    ],
    theme: {

    },
    plugins: [
    ],
});

// export default {
//   content: [
//     "./src/*.jsx",
//     "./src/components/**/*.jsx"
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         'poppins': ['Poppins'],
//         'sans':['sans-serif'],
//       },
//     },
//   },
//   plugins: [],
// }

