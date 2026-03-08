import { MatchUser } from "@/components/MatchCard";

export const mockUsers: MatchUser[] = [
  {
    id: "1",
    name: "Sarah Chen",
    location: "San Francisco, USA",
    bio: "Full-stack developer passionate about teaching Python and machine learning. Looking to learn Rust for systems programming.",
    avatar: "",
    teaches: ["Python", "Machine Learning", "Django"],
    wants: ["Rust", "Go", "Systems Design"],
    matchPercentage: 95,
    online: true,
  },
  {
    id: "2",
    name: "Marcus Weber",
    location: "Berlin, Germany",
    bio: "C++ veteran with 10 years of game dev experience. Want to pick up modern web technologies.",
    avatar: "",
    teaches: ["C++", "Game Dev", "OpenGL"],
    wants: ["React", "TypeScript", "Node.js"],
    matchPercentage: 88,
    online: true,
  },
  {
    id: "3",
    name: "Aisha Patel",
    location: "Mumbai, India",
    bio: "Data scientist who loves R and statistics. Eager to learn mobile development with Flutter.",
    avatar: "",
    teaches: ["R", "Statistics", "Data Viz"],
    wants: ["Flutter", "Dart", "Mobile Dev"],
    matchPercentage: 72,
    online: false,
  },
  {
    id: "4",
    name: "Lucas Moreno",
    location: "São Paulo, Brazil",
    bio: "Rust enthusiast and open-source contributor. Want to learn Python for data science.",
    avatar: "",
    teaches: ["Rust", "Go", "Linux"],
    wants: ["Python", "Machine Learning", "TensorFlow"],
    matchPercentage: 95,
    online: true,
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    location: "Tokyo, Japan",
    bio: "Frontend developer specializing in React and TypeScript. Looking to learn backend with Go.",
    avatar: "",
    teaches: ["React", "TypeScript", "CSS"],
    wants: ["Go", "Docker", "Kubernetes"],
    matchPercentage: 82,
    online: false,
  },
  {
    id: "6",
    name: "Elena Volkov",
    location: "Moscow, Russia",
    bio: "DevOps engineer experienced in Kubernetes and Docker. Interested in learning frontend development.",
    avatar: "",
    teaches: ["Docker", "Kubernetes", "CI/CD"],
    wants: ["React", "Vue.js", "UI Design"],
    matchPercentage: 68,
    online: true,
  },
];

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export const mockMessages: ChatMessage[] = [
  { id: "1", senderId: "1", text: "Hey! I saw we have a 95% match. I'd love to teach you Python!", timestamp: new Date(Date.now() - 3600000 * 2) },
  { id: "2", senderId: "me", text: "That's awesome! I've been wanting to learn Python for ML. I can help you with Rust in return.", timestamp: new Date(Date.now() - 3600000) },
  { id: "3", senderId: "1", text: "Perfect! When are you free for our first session? I'm available evenings UTC.", timestamp: new Date(Date.now() - 1800000) },
  { id: "4", senderId: "me", text: "Evenings work great for me too. How about we start with the basics this Thursday?", timestamp: new Date(Date.now() - 900000) },
  { id: "5", senderId: "1", text: "Thursday it is! I'll prepare some beginner-friendly exercises. Looking forward to it! 🎉", timestamp: new Date(Date.now() - 300000) },
];
