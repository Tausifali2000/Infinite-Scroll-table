import { users } from "../server.js";

export async function fetchUsers(req, res) {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  
  try {

    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / limit);

    const usersOnPage = users.slice(startIndex, startIndex + limit);
    
    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
      users: usersOnPage,
    });
  } catch (error) {
    console.error('Error fetching users from JSON:', error);
    res.status(500).json({ message: 'Failed to fetch users' });  
  }
}