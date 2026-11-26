async function getProjectVisibilityQuery(user) {
  if (user.role === 'admin') {
    return {};
  }

  return {
    $or: [
      { owner: user._id },
      { members: user._id },
    ],
  };
}

function isProjectParticipant(project, user) {
  const ownerId = project.owner?._id || project.owner;
  if (ownerId.toString() === user._id.toString()) {
    return true;
  }

  return (project.members || []).some(
    (member) => (member._id || member).toString() === user._id.toString()
  );
}

async function canAccessProject(project, user) {
  return user.role === 'admin' || isProjectParticipant(project, user);
}

module.exports = {
  canAccessProject,
  getProjectVisibilityQuery,
  isProjectParticipant,
};
