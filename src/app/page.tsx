import {redirect} from "next/navigation";

export default function Home() {
    redirect("/Homepage"); // TODO: promjeniti ovo da se prikazuje homepage na /, a ne na /Homepage
}
