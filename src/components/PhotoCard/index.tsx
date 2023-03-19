import { useRouter } from "next/router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";

import styles from "./PhotoCard.module.css";

interface PhotoCardProps {
  title: string;
  slug: string;
  description: string;
  cover: string;
}

export default function PhotoCard({
  title,
  slug,
  description,
  cover,
}: PhotoCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(slug)}
      className={styles["collection-card"]}
    >
      <CardActionArea>
        <CardMedia component="img" image={cover} alt={title} />
        <CardContent>
          <Typography
            variant="h6"
            className={styles["collection-title"]}
            fontFamily="Source Sans Pro"
            gutterBottom
          >
            {title.toUpperCase()}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontFamily="Source Sans Pro"
            className={styles["collection-description"]}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
