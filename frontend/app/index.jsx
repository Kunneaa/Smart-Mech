import { useRouter } from "expo-router";
import LoadingPage from "../components/LoadingPage";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/(auth)/Login');
    }, 4000); 

    return () => clearTimeout(timer); 
  }, [router]);

  return (
    <LoadingPage/>
  );
}
