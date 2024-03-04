export const ThinkMessage = () => {
  return (
    <div className="flex flex-row gap-2 relative max-w-[90%]">
      <div className="font-barlow p-2 text-white text-sm bg-black/10 backdrop-blur-2xl rounded-lg whitespace-pre-line">
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      </div>
    </div>
  );
};
