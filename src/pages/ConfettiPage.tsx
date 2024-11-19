import Confetti from 'react-confetti'

export default function ConfettiPage() {

  return (
    <Confetti
    className='border'
      width={500}
      height={500}
      colors={['#00aae7','#2368a0','#0d416b','#ef4048','#232527']}
      recycle={false}
    />
  )
}