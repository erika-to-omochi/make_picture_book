import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ pagination, onPageChange }) => {
  const { current_page, next_page, prev_page, total_pages } = pagination;

  const createPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // 表示するページ数の最大値
    let start = Math.max(current_page - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;

    if (end > total_pages) {
      end = total_pages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = createPageNumbers();

  return (
    <div className="join">
      {/* 前ページボタン */}
      <button
        className={`join-item btn ${prev_page ? '' : 'btn-disabled'}`}
        onClick={() => onPageChange(prev_page)}
        disabled={!prev_page}
      >
        «
      </button>

      {/* ページ番号ボタン */}
      {pages.map((page) => (
        <button
          key={page}
          className={`join-item btn ${
            page === current_page
              ? 'bg-bodyText text-white cursor-default'
              : ''
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {/* 次ページボタン */}
      <button
        className={`join-item btn ${next_page ? '' : 'btn-disabled'}`}
        onClick={() => onPageChange(next_page)}
        disabled={!next_page}
      >
        »
      </button>
    </div>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    current_page: PropTypes.number.isRequired,
    next_page: PropTypes.number,
    prev_page: PropTypes.number,
    total_pages: PropTypes.number.isRequired,
    total_count: PropTypes.number.isRequired,
    limit_value: PropTypes.number.isRequired,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
