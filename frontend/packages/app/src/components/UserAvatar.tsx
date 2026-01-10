import { Avatar } from '@radix-ui/themes';

interface UserAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
}

export function UserAvatar({
  name = 'User',
  imageUrl,
  size = '2',
}: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar
      src={imageUrl}
      fallback={initials}
      size={size}
      radius="large"
      variant="solid"
      color="violet"
    />
  );
}
