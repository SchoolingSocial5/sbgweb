"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const Success: React.FC = () => {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const success = localStorage.getItem("success");
    if (success !== "True") {
      router.replace("/auth/sign-up");
    } else {
      localStorage.removeItem("success");
    }
    hasRun.current = true;
  }, [router]);

  return (
    <>
      <div className="title">Confirm your Email</div>
      <Image
        src="/images/email.png"
        loading="lazy"
        sizes="100vw"
        width={0}
        height={0}
        style={{ width: "auto", height: "auto" }}
        alt=""
        className="mb-10"
      />
      <div className="text-2xl text-[var(--text-title-color)] text-center mb-5">
        A link to reset your password has been sent to your email
      </div>
      <Link href="/sign-in" className="custom-btn ">
        Sign In &amp; Continue
      </Link>
    </>
  );
};

export default Success;
