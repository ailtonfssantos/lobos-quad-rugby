// frontend/src/components/Icons.jsx
export const Icon = ({ path, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export const ArrowUpRight = ({ className = 'w-5 h-5' }) => (
  <Icon className={className} path="M7 17L17 7M7 7h10v10" />
);

export const ArrowRight = ({ className = 'w-5 h-5' }) => (
  <Icon className={className} path="M5 12h14M13 6l6 6-6 6" />
);

export const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <Icon className={className} path="M5 12l4 4L19 6" />
);