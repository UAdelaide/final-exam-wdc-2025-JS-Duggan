

router.get('/dogs', async function(req, res, next) {
  try {
    const [dogs] = await db.execute(`
      SELECT
        name as dog_name,
        size,
        (SELECT username FROM Users WHERE user_id = owner_id) as owner_username
      FROM
        Dogs;
      `);
    res.status(200).json(dogs);
  } catch (error) {
    res.status(400).send('Error: ' + error);
  }
});