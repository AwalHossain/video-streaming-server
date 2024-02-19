//1. unit under test
describe('Check two newly created time', () => {
    describe('time', () => {
      //2. scenario and 3. expectation
      let time1 = new Date();
        let time2 = new Date();
        it('should be the same', () => {
        expect(time1).toStrictEqual(time2);
        });
    });
  });