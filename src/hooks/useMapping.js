import usePlans from './usePlans';

const useMapping = () => {
  const { plans } = usePlans();
  return plans.reduce((acc, curr) => {
    const { Name: key, id } = curr;
    if (!Object.hasOwn(acc, key)) {
      return {
        ...acc,
        [key]: id,
      };
    }
    return acc;
  }, {});
};

export default useMapping;
