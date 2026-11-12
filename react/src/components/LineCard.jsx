import { useNavigate } from 'react-router-dom';

function LineCard({ line }) {
const navigate = useNavigate();

const statusStyle = {
start: 'bg-white text-slate-700 border border-slate-300',
request: 'bg-green-500 text-white',
confirm: 'bg-blue-600 text-white',
};

return (
<button
onClick={() => navigate(`/line/${line.id}`)}
className='w-full bg-white rounded-3xl p-5 shadow-md border border-slate-200 active:scale-95 transition duration-200'
>

  <div className='flex items-center justify-between mb-4'>

    <div>
      <h3 className='text-xl font-bold text-slate-800'>
        Line {line.id}
      </h3>
      <p className='text-xs text-slate-500 mt-1'>
        Shift {line.shift}
      </p>
    </div>

    <div className='w-3 h-3 rounded-full bg-green-500'></div>

  </div>

  <div className='space-y-3'>

    <div className='flex items-center justify-between'>
      <span className='text-sm text-slate-600'>
        Bumbu
      </span>

      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[line.status]}`}
      >
        {line.status === 'start'
          ? 'Start'
          : line.status === 'request'
          ? 'Request'
          : 'Confirm'}
      </span>

    </div>

    <div className='flex items-center justify-between'>
      <span className='text-sm text-slate-600'>
        Minyak
      </span>

      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[line.status]}`}
      >
        {line.status === 'start'
          ? 'Start'
          : line.status === 'request'
          ? 'Request'
          : 'Confirm'}
      </span>

    </div>

  </div>

  <div className='mt-5 pt-4 border-t border-slate-200'>

    <div className='flex justify-between text-sm'>

      <span className='text-slate-500'>
        Total Request
      </span>

      <span className='font-bold text-slate-800'>
        {line.request}
      </span>

    </div>

  </div>

</button>

);
}

export default LineCard;
