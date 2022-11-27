function Icons() {
  return (
    <svg
      style={
        {display: 'none'}
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Material Icons from https://fonts.google.com/icons?icon.style=Outlined */}
        <g id="MenuIcon">
          <path d="M3 18V16H21V18ZM3 13V11H21V13ZM3 8V6H21V8Z" />
        </g>
        <g id="CloseIcon">
          <path d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4Z" />
        </g>
      </defs>
    </svg>
  );
}

export {Icons};