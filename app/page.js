import { getAllFolders } from "@/lib/grammar";
import HomeLibraryView from "@/components/HomeLibraryView";

export default function HomePage() {
  const folders = getAllFolders();
  return <HomeLibraryView folders={folders} />;
}
