const achievement = require('./achievement');
const dontPersist = require('./testUtil/dontPersist');

const testAchievement = {
  achievement: 'Testeuse',
  user: {
    username: 'someone',
    'display-name': 'Someone',
  },
};

test('new achievement saved and showed', (done) => {
  const store = dontPersist();
  const mockShow = jest.fn();
  const ach = achievement(store, mockShow);
  ach.received(testAchievement, () => {
    expect(mockShow.mock.calls.length).toBe(1);
    expect(mockShow.mock.calls[0][0]).toEqual({
      achievement: 'Testeuse',
      username: 'Someone',
      text: '%USER% bidouille des trucs',
    });
    const stored = store.getItemSync('achievements');
    expect(stored.length).toBe(1);
    expect(stored[0]).toEqual({ username: 'someone', achievement: 'Testeuse' });
    done();
  });
});

test('default text for unknown achievement', (done) => {
  const ach = achievement(dontPersist(), (toShow) => {
    expect(toShow.text).toBe('Bravo %USER% !');
    done();
  });
  ach.received({
    achievement: 'unknown',
    user: { username: 'someone', 'display-name': 'Someone' },
  }, () => {});
});

test('nothing showed for existing achievement', (done) => {
  const store = dontPersist();
  const mockShow = jest.fn();
  const ach = achievement(store, mockShow);
  store.setItemSync('achievements', [{ username: 'someone', achievement: 'Testeuse' }]);
  ach.received(testAchievement, () => {
    expect(mockShow.mock.calls.length).toBe(0);
    done();
  });
});

test('get return achievements array', (done) => {
  const store = dontPersist();
  store.setItemSync('achievements', [
    { username: 'someone', achievement: 'Testeuse' },
    { username: 'someone', achievement: 'Truqueuse' },
  ]);
  const ach = achievement(store, () => {});
  ach.get('someone', (error, list) => {
    expect(error).toBeFalsy();
    expect(list).toEqual(['Testeuse', 'Truqueuse']);
    done();
  });
});

test('get returns empty array if nothing found', (done) => {
  const store = dontPersist();
  const ach = achievement(store, () => {});
  ach.get('someone', (error, list) => {
    expect(error).toBeFalsy();
    expect(list).toEqual([]);
    done();
  });
});
