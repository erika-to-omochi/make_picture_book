"use client";

import { useState } from "react";
import axiosInstance from '../../api/axios';

const ContactForm = () => {
  const [form, setForm] = useState({
    question_type: "",
    other_question_type: "", // 追加: "その他"の内容
    content: "",
    name: "",
    email: "",
    rating: "",
    rating_reason: "",
    agreement: false, // 変更: 初期値を `false` に設定
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // チェックボックスがチェックされていない場合、アラートを表示
    if (!form.agreement) {
      alert("「了承しました。」にチェックを入れてください。");
      return;
    }

    // 固定値を `agreement` フィールドに設定
    const formData = {
      ...form,
      agreement: "1733047427250", // チェックされた場合に固定値を送信
    };

    try {
      const response = await axiosInstance.post("/forms", { form: formData });
      if (response.status === 200) {
        alert("送信しました！");
        setForm({
          question_type: "",
          other_question_type: "",
          content: "",
          name: "",
          email: "",
          rating: "",
          rating_reason: "",
          agreement: false, // 初期値にリセット
        });
      }
    } catch (error) {
      console.error(error);
      alert("送信に失敗しました。");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 mb-20">
      <h1 className="text-3xl font-bold mb-4">お問い合わせページ</h1>
      <p className="text-l text-bodyText mb-8 text-center">
        絵本がぽんっをご利用頂きありがとうございます。
        <br />
        下記よりご入力頂き、一番下の「送信」ボタンをクリックして下さい。
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-70 p-6 rounded-lg shadow-md space-y-6"
      >
        {/* お問い合わせ内容の種類 */}
        <div>
          <label className="block text-lg font-medium text-heading">
            お問い合わせ内容の種類
          </label>
          <div className="space-y-2 mt-2">
            {["ご質問", "ご意見・ご要望", "不具合の報告", "その他"].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="question_type"
                  value={type}
                  checked={form.question_type === type}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-icon"
                />
                <span className="text-bodyText">{type}</span>
              </label>
            ))}
            {form.question_type === "その他" && (
              <div>
                <input
                  type="text"
                  name="other_question_type"
                  value={form.other_question_type}
                  onChange={handleChange}
                  placeholder="その他の内容を入力"
                  className="w-full mt-2 px-3 py-2 border rounded-md text-bodyText"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label className="block text-lg font-medium text-heading">
            お問い合わせ内容
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full mt-2 px-3 py-2 border rounded-md text-bodyText"
            required
          />
        </div>

        {/* 名前 */}
        <div>
          <label className="block text-lg font-medium text-heading">お名前</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full mt-2 px-3 py-2 border rounded-md text-bodyText"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-lg font-medium text-heading">
          メールアドレス
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-2 px-3 py-2 border rounded-md text-bodyText"
          />
        </div>

        {/* 評価 */}
        <div>
          <label className="block text-lg font-medium text-heading">
            このアプリについての評価を教えてください。
          </label>
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <label
                key={num}
                className={`text-5xl cursor-pointer ${
                  form.rating >= num.toString()
                    ? "text-red-400"
                    : "text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={form.rating === num.toString()}
                  onChange={handleChange}
                  className="hidden"
                />
                ♥
              </label>
            ))}
          </div>
          <div>
            <label className="block text-lg font-medium text-heading">
              上記評価の理由
            </label>
            <textarea
              name="rating_reason"
              value={form.rating_reason}
              onChange={handleChange}
              className="w-full mt-2 px-3 py-2 border rounded-md text-bodyText"
              required
            />
          </div>
        </div>

        {/* 了承のチェックボックス */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="agreement"
            checked={form.agreement}
            onChange={handleChange}
            required
            className="w-4 h-4 text-icon"
          />
          <span className="ml-2 text-bodyText">了承しました。</span>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-customButton text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
