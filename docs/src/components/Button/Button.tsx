import {  ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  children?: ReactNode;
  className?: string;
  color?: string;
  href?: string;
}

const Button = ({ children, className = '', href }: ButtonProps) => {

  const buttonColor = 'text-white bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-slate-400';
  const buttonStyles = `inline-block rounded py-2.5 px-6 text-sm font-bold uppercase ${buttonColor} ${className}`

  if ( href ) {
    return (
      <Link className={buttonStyles} href={href} rel="noreferrer noopener">
        { children }
      </Link>
    )
  }

  return (
    <button className={buttonStyles}>
      { children }
    </button>
  )
}

export default Button;