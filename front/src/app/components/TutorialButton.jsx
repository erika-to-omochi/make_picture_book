import React from 'react';

function TutorialButton({ icon, title, description }) {
  return (
    <div
      className="shadow-md rounded-lg p-4 mb-4 max-w-md mx-auto"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.75)" }}
    >
      <div className="flex items-center">
        {/* アイコン */}
        <div className="w-12 h-12 flex items-center justify-center mr-4">
          {React.cloneElement(icon, { size: 36 })}
        </div>

        {/* タイトルと説明 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* 再生ボタン */}
        <button
          className="btn btn-circle text-white ml-4"
          style={{ backgroundColor: "#494444" }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default TutorialButton;
