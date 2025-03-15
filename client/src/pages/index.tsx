import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000");

socket.on('connect', () => {
  console.log('Connected to server');
});

export function emitEvent(eventName: string, data: any) {
  socket.emit(eventName, data);
}

export default function IndexPage() {
  return (
    <DefaultLayout>
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <span className={title()}>Task&nbsp;</span>
        <span className={title({ color: "violet" })}>Together&nbsp;</span>
        <div className={subtitle({ class: "mt-4" })}>
          A Simple Task Manager.
        </div>
      </div>
    </section>
  </DefaultLayout>
  );
}
