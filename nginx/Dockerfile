FROM voicelap_frontend:latest AS frontend

FROM nginx:stable-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY conf.d/site.conf /etc/nginx/conf.d/site.conf
COPY --from=frontend /app/dist /usr/share/nginx/html
RUN mkdir -p /etc/letsencrypt
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

