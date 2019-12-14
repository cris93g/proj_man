INSERT INTO project_users
    (first_name,last_name,auth_id,pic)
VALUES
    ($1, $2,
        $3, $4)
RETURNING *;