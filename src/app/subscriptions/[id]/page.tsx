import SubscriptionDetailsPage from '../../subscription-details/page';

export function generateStaticParams() {
  return [
    { id: 'SUB-10024' },
    { id: 'SUB-10023' },
    { id: 'SUB-10022' },
    { id: 'SUB-10021' },
    { id: 'SUB-10020' },
    { id: 'SUB-10019' },
  ];
}

export default SubscriptionDetailsPage;
