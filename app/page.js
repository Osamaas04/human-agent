import { listenForNewMessages } from "@/lib/listenForNewMessages";

export async function getServerSideProps() {
  await listenForNewMessages(); 
  return { props: {} };
}

export default function Home() {
  return <div>Webhook listener active...</div>;
}
