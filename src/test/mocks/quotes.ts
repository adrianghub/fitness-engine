import { http, HttpResponse } from "msw";

// Sample motivational quotes
const sampleQuotes = [
  {
    q: "The only person you should try to be better than is the person you were yesterday.",
    a: "Anonymous",
    h: "<blockquote>&ldquo;The only person you should try to be better than is the person you were yesterday.&rdquo; <footer>&mdash;Anonymous</footer></blockquote>",
  },
  {
    q: "The difference between try and triumph is just a little umph!",
    a: "Marvin Phillips",
    h: "<blockquote>&ldquo;The difference between try and triumph is just a little umph!&rdquo; <footer>&mdash;Marvin Phillips</footer></blockquote>",
  },
  {
    q: "If you want something you've never had, you must be willing to do something you've never done.",
    a: "Thomas Jefferson",
    h: "<blockquote>&ldquo;If you want something you've never had, you must be willing to do something you've never done.&rdquo; <footer>&mdash;Thomas Jefferson</footer></blockquote>",
  },
  {
    q: "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success. Greatness will come.",
    a: "Dwayne Johnson",
    h: "<blockquote>&ldquo;Success isn't always about greatness. It's about consistency. Consistent hard work leads to success. Greatness will come.&rdquo; <footer>&mdash;Dwayne Johnson</footer></blockquote>",
  },
  {
    q: "The body achieves what the mind believes.",
    a: "Napoleon Hill",
    h: "<blockquote>&ldquo;The body achieves what the mind believes.&rdquo; <footer>&mdash;Napoleon Hill</footer></blockquote>",
  },
];

// HTTP handlers for ZenQuotes API
export const quotesHandlers = [
  http.get("https://zenquotes.io/api/random", () => {
    // Return a random quote from the sample quotes
    const randomIndex = Math.floor(Math.random() * sampleQuotes.length);
    return HttpResponse.json([sampleQuotes[randomIndex]]);
  }),
];
