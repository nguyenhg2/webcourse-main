package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := parseToken(c.GetHeader("Authorization"), secret)
		if !ok {
			abort(c, http.StatusUnauthorized, "Token không hợp lệ")
			return
		}

		if userID := claimString(claims, "user_id"); userID != "" {
			c.Set("user_id", userID)
		} else if sub := claimString(claims, "sub"); sub != "" {
			c.Set("user_id", sub)
		}
		if role := claimString(claims, "role"); role != "" {
			c.Set("role", role)
		}

		c.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, role := range roles {
			if c.GetString("role") == role {
				c.Next()
				return
			}
		}
		abort(c, http.StatusForbidden, "Không đủ quyền thực hiện")
	}
}

func RequireInternalToken(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if secret != "" && c.GetHeader("X-Internal-Token") != secret {
			abort(c, http.StatusUnauthorized, "Internal token không hợp lệ")
			return
		}
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, PATCH, DELETE")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Internal-Token")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func parseToken(header string, secret string) (jwt.MapClaims, bool) {
	if !strings.HasPrefix(header, "Bearer ") {
		return nil, false
	}

	raw := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
	if raw == "" {
		return nil, false
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(raw, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenSignatureInvalid
		}
		return []byte(secret), nil
	})
	return claims, err == nil && token.Valid
}

func claimString(claims jwt.MapClaims, key string) string {
	value, _ := claims[key].(string)
	return value
}

func abort(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
	c.Abort()
}
