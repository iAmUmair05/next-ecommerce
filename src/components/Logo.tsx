import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href={"/"}>
      <h3 className="text-3xl text-white font-semibold hidden sm:block cursor-pointer duration-200">
        Shopper.
      </h3>
    </Link>
  );
};

export default Logo;
